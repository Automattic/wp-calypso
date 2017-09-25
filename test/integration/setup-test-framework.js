// Make sure we can share test helpers between Mocha and Jest
global.after = global.afterAll;
global.before = global.beforeAll;
