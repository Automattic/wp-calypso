# i18nlint

This is a tool to programmatically check for problematic calls to translate() in the Automattic:Calypso project.

It's primary purpose is to automat(t)ically scan files on commit and report issues.  It will return an exit code of 1 if it finds any issues.  E.g:

     ~/calypso/server/i18nlint (master) $ git commit -m 'example' test/testfiles/duplicate-placeholders.js 
    
    Validating translatable strings:
    
    i18nlint Failed: server/i18nlint/test/testfiles/duplicate-placeholders.js
    line 15, col 19: translate( 'One: %s, Two: %s', … )
        Translators need to be able to change the order of strings, so multiple placeholders in a translation should be named. E.g.:
        translate('%(greeting)s, %(name)s!', { args: { greeting:'Hello', name:'World' } } )"
    
     -----
    
    
    Validating .jsx and .js:
    
    eslint Passed: server/i18nlint/test/testfiles/duplicate-placeholders.js
    
    eslint validation complete
    
    COMMIT FAILED: Your commit contains files that should pass validation tests but do not. Please fix the errors and try again.


It is also possible to link bin/i18nlint-cli.js somewhere more convenient, and then pass it the name of a single .js or .jsx file to check:

    ~ $ i18nlint test/testfiles/duplicate-placeholders.js 
    server/i18nlint/test/testfiles/duplicate-placeholders.js
    line 15, col 19: translate( 'One: %s, Two: %s', … )
        Translators need to be able to change the order of strings, so multiple placeholders in a translation should be named. E.g.:
        translate('%(greeting)s, %(name)s!', { args: { greeting:'Hello', name:'World' } } )"

    ~ $ i18nlint test/testfiles/hashbang.js
    server/i18nlint/test/testfiles/hashbang.js
    line 15, col 32: translate( 'One thing', '%d things'… )
        Placeholders in the plural and singular strings should match, as some languages use the singular for values like 21, 31 etc.  If there should be a different string for 1 or 0, special case it in the code.


i18nlint fails silently if the jsx transformation or AST parsing fails unless the `DEBUG=calypso:i18nlint` environment variable is set.

### Future Directions:
Additional linting features can be suggested by opening issues tagged 'i18nlint' in github.
