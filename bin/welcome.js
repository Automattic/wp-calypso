#! /usr/env/bin node

const process = require( 'process' );
const chalk = require( 'chalk' );

console.log( chalk.cyan( '             _                           ' ) );
console.log( chalk.cyan( '    ___ __ _| |_   _ _ __  ___  ___      ' ) );
console.log( chalk.cyan( "   / __/ _` | | | | | '_ \\/ __|/ _ \\ " ) );
console.log( chalk.cyan( '  | (_| (_| | | |_| | |_) \\__ \\ (_) |  ' ) );
console.log( chalk.cyan( '   \\___\\__,_|_|\\__, | .__/|___/\\___/ ' ) );
console.log( chalk.cyan( '               |___/|_|                \n' ) );

if ( process.env.MOCK_WORDPRESSDOTCOM === '1' ) {
	console.log(
		`Mocking WordPress.com
- Add ${ chalk.yellowBright( '127.0.0.1 wordpress.com' ) } to your hosts file.
- Type ${ chalk.white.bgBlue( ' thisisunsafe ' ) } in Chrome when you visit wordpress.com.
`
	);
}
