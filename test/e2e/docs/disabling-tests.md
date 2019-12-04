# Disable tests and steps

## To disable an individual test

Sometimes you will need to disable specific test, eg. functionality is currently broken and you are waiting for a fix. You can simply do that by adding `.skip` after `describe`:

`describe.skip( 'Sign up for free subdomain site @parallel', function() {`

## To disable an individual step

Steps could also be disabled by adding `x` before `step`. First `xstep` needs to be imported if it's not already:

`import { xstep } from 'mocha-steps';`

and then:

`xstep( 'Can see the domain search component', async function() {`
