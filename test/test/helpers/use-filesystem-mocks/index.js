import useMockery from 'test/helpers/use-mockery';
import glob from 'glob';
import mockery from 'mockery';
import path from 'path';
import debug from 'debug';
import partial from 'lodash/partial';

const log = debug('calypso:test:quick-mock');

function findQuickMocks(dirpath) {
    return new Promise(function(resolve, reject) {
        glob(
            '*/**/*.+(js|jsx)',
            {
                cwd: dirpath,
            },
            function(err, fakes) {
                if (err) {
                    reject(err);
                    return;
                }

                fakes.forEach(function(fake) {
                    const moduleName = fake
                        .substring(fake, fake.lastIndexOf('.'))
                        .replace(/\/index$/, ''),
                        fakePath = path.join(dirpath, fake);
                    log('registering %s -> %s', moduleName, fakePath);
                    mockery.registerSubstitute(moduleName, fakePath);
                });
                resolve();
            }
        );
    });
}

export default function(dirpath) {
    useMockery(partial(findQuickMocks, dirpath));
}
