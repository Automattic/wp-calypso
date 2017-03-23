import noop from 'lodash/noop';

const poller = {
    add: noop,
    remove: noop,
    pauseAll: noop,
    resumePaused: noop,
};

export default mockery => {
    mockery.registerMock('lib/data-poller', poller);
};
