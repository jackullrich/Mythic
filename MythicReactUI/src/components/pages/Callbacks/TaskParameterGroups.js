const getGroupName = (group) => {
    if(typeof group === "string"){
        return group;
    }
    if(group && typeof group === "object"){
        return group.group_name || group.parameter_group_name || group.name || "";
    }
    return "";
}

const getGroupPosition = (group, fallback) => {
    if(group && typeof group === "object"){
        const position = group.ui_position ?? group.uiPosition ?? group.position;
        if(Number.isFinite(position)){
            return position;
        }
    }
    return fallback;
}

const isDefaultGroup = (group) => {
    if(!group || typeof group !== "object"){
        return false;
    }
    return Boolean(group.default || group.default_group || group.is_default);
}

export const getCommandParameterGroups = (command) => {
    const groups = [];
    const addGroup = ({name, position, defaultGroup}) => {
        const groupName = name || "Default";
        const existingIndex = groups.findIndex((group) => group.name === groupName);
        if(existingIndex >= 0){
            groups[existingIndex] = {
                ...groups[existingIndex],
                defaultGroup: groups[existingIndex].defaultGroup || defaultGroup,
                position: Math.min(groups[existingIndex].position, position),
            };
            return;
        }
        groups.push({name: groupName, position, defaultGroup});
    }

    const declaredGroups = command?.attributes?.parameter_groups || command?.attributes?.parameterGroups || [];
    if(Array.isArray(declaredGroups)){
        declaredGroups.forEach((group, index) => {
            const name = getGroupName(group);
            if(name !== ""){
                addGroup({
                    defaultGroup: isDefaultGroup(group),
                    name,
                    position: getGroupPosition(group, index),
                });
            }
        });
    }

    const declaredCount = groups.length;
    const parameters = command?.commandparameters || [];
    parameters.forEach((parameter, index) => {
        addGroup({
            defaultGroup: false,
            name: parameter.parameter_group_name || "Default",
            position: declaredCount + (parameter.ui_position ?? index),
        });
    });

    groups.sort((a, b) => {
        if(a.position === b.position){
            return a.name > b.name ? 1 : -1;
        }
        return a.position > b.position ? 1 : -1;
    });
    return groups;
}

export const getCommandParameterGroupNames = (command) => {
    return getCommandParameterGroups(command).map((group) => group.name);
}

export const getPreferredCommandParameterGroupName = (command) => {
    const groups = getCommandParameterGroups(command);
    const defaultGroup = groups.find((group) => group.defaultGroup);
    return defaultGroup?.name || groups[0]?.name || "Default";
}
