/**
 * External dependencies
 */
import sinon from 'sinon';

const exported = {
 togglePluginActivation: sinon.spy(),
 removePluginsNotices: () => {}
};

export default exported;

export const {
 togglePluginActivation,
 removePluginsNotices
} = exported;
