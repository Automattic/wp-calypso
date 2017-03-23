export default {
    linkState(key) {
        let link = {};
        link.value = this.state[key];
        link.requestChange = newValue => {
            let newState = {};
            newState[key] = newValue;
            const dirtyFields = this.state.dirtyFields || [];
            if (dirtyFields.indexOf(key) === -1) {
                newState.dirtyFields = [...dirtyFields, key];
            }
            this.setState(newState);
        };
        return link;
    },
};
