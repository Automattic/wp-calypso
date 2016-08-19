/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import FilePicker from 'components/file-picker';
import MeSidebarNavigation from 'me/sidebar-navigation';

/*
 * Module variables
 */

const JetpackSSOForm = React.createClass( {
	displayName: 'GravatarUpload',

	getInitialState() {
		return {
			selectedImage: false
		};
	},

	goBack() {
		page.back( '/me' );
	},

	onPick( files ) {
		const file = files [ 0 ];
		if ( ! file ) {
			return;
		}

		console.log( file );

		this.setState( {
			selectedImage: file
		} );
	},

	render() {
		return (
			<Main>
				<MeSidebarNavigation />
				<HeaderCake isCompact onClick={ this.goBack }>
					{ this.translate( 'Update Gravatar' ) }
				</HeaderCake>

				<Card>
					<FilePicker accept="image/*" onPick={ this.onPick } >
						<a href="#">Select an image!</a>
					</FilePicker>
				</Card>
			</Main>
		);
	}
} );

export default connect()( JetpackSSOForm );
