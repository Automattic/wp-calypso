/**
 * External dependencies
 */
import { expect } from 'chai';

import { wpcomImplementation, fallbackImplementation } from '..';

describe('pathToSection', () => {
    describe('wpcomImplementation', () => {
        it('should assume the Reader as the app root', () => {
            expect(wpcomImplementation('/')).to.equal('reader');
        });
        it('should handle cases where path and section have different names', () => {
            expect(wpcomImplementation('/design')).to.equal('themes');
            expect(wpcomImplementation('/read')).to.equal('reader');
        });
        it('should handle deep paths', () => {
            expect(wpcomImplementation('/me/account')).to.equal('me');
        });
    });

    describe('fallbackImplementation', () => {
        it('should assume the top of the path is the section', () => {
            expect(fallbackImplementation('/foo/bar')).to.equal('foo');
        });
        it('should return null if unsuccessful', () => {
            expect(fallbackImplementation('/')).to.equal(null);
        });
    });
});
