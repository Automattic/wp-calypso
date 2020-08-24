/**
 * Internal dependencies
 */
const multiline = require( '../formatters/multiline' );

describe( 'multiline', function () {
	test( 'should not split a short literal into multiple lines', function () {
		const literal = '"Lorem ipsum dolor sit amet"';
		expect( multiline( literal ) ).toBe( '"Lorem ipsum dolor sit amet"' );
	} );

	test( 'should split a long literal into multiple lines', function () {
		// normal text
		const literal1 =
			'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."';
		expect( multiline( literal1 ) ).toBe(
			[
				'""',
				'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
				'"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, "',
				'"quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo "',
				'"consequat."',
			].join( '\n' )
		);

		// long words
		const literal2 =
			'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporincididuntutlaboreetdoloremagnaaliqua.Utenimadminimveniamquisnostrudexercitationullamco laborisnisiutaliquipexeacommodo consequat."';
		expect( multiline( literal2 ) ).toBe(
			[
				'""',
				'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
				'"temporincididuntutlaboreetdoloremagnaaliqua.Utenimadminimveniamquisnostrudexercitationullamco "',
				'"laborisnisiutaliquipexeacommodo consequat."',
			].join( '\n' )
		);

		// 1 line just longer than 79 characters
		const literal3 =
			'"If you’re looking to paste rich content from Microsoft Word, try turning this option off. The editor will clean up text pasted from Word automatically."';
		expect( multiline( literal3 ) ).toBe(
			[
				'""',
				'"If you’re looking to paste rich content from Microsoft Word, try turning "',
				'"this option off. The editor will clean up text pasted from Word "',
				'"automatically."',
			].join( '\n' )
		);

		// 2 lines of 78 characters
		const literal4 =
			'"The registry for your domains requires a special process for transfers. Our Happiness Engineers have been notified about your transfer request. Tnk you."';
		expect( multiline( literal4 ) ).toBe(
			[
				'""',
				'"The registry for your domains requires a special process for transfers. Our "',
				'"Happiness Engineers have been notified about your transfer request. Tnk you."',
			].join( '\n' )
		);

		// A space after 79 characters
		const literal5 =
			'"%d file could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support."';
		expect( multiline( literal5 ) ).toBe(
			[
				'""',
				'"%d file could not be uploaded because your site does not support video "',
				'"files. Upgrade to a premium plan for video support."',
			].join( '\n' )
		);

		// short words
		const literal6 =
			'"a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9. a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9."';
		expect( multiline( literal6 ) ).toBe(
			[
				'""',
				'"a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9. a b "',
				'"c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9."',
			].join( '\n' )
		);
	} );

	test( 'should add an empty line first if the literal can fit on one line without the prefix', function () {
		const literal =
			'"There is an issue connecting to %s. {{button}}Reconnect {{icon/}}{{/button}}"';
		expect( multiline( literal ) ).toBe(
			[
				'""',
				'"There is an issue connecting to %s. {{button}}Reconnect {{icon/}}{{/button}}"',
			].join( '\n' )
		);
	} );

	test( 'should not add an empty line if the literal length is less or equal to 73 characters (79 - lengthOf("msgid "))', function () {
		const literal = '"Testimonials are not enabled. Open your site settings to activate them."';
		expect( multiline( literal ) ).toBe(
			'"Testimonials are not enabled. Open your site settings to activate them."'
		);
	} );

	test( 'should split text on a /', function () {
		const literal =
			'"{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/emailPreferences}}"';
		expect( multiline( literal ) ).toBe(
			[
				'""',
				'"{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/"',
				'"emailPreferences}}"',
			].join( '\n' )
		);
	} );

	test( 'should work with longer prefixes', function () {
		const literal =
			'"Categories: info popover text shown when creating a new category and selecting a parent category."';
		expect( multiline( literal, 'msgctxt ' ) ).toBe(
			[
				'""',
				'"Categories: info popover text shown when creating a new category and "',
				'"selecting a parent category."',
			].join( '\n' )
		);
	} );

	test( 'should work with very long words', function () {
		const literal =
			'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamco laborisnisiutaliquipexeacommodo consequat."';
		expect( multiline( literal ) ).toBe(
			[
				'""',
				'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
				'"temporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamco "',
				'"laborisnisiutaliquipexeacommodo consequat."',
			].join( '\n' )
		);
	} );

	test( 'should not break very long line without separators', function () {
		const literal =
			'"LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequat."';
		expect( multiline( literal ) ).toBe(
			[
				'""',
				'"LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequat."',
			].join( '\n' )
		);
	} );
} );
