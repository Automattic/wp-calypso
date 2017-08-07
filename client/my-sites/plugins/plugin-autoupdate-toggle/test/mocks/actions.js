import sinon from 'sinon';

const exported = {
    togglePluginAutoUpdate: sinon.spy(),
    removePluginsNotices: function() {}
};

export default exported;

export const {
    togglePluginAutoUpdate,
    removePluginsNotices
} = exported;
