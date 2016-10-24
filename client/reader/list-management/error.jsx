// External dependencies
import React from 'react';

// Internal dependencies
import Main from 'components/main';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import EmptyContent from 'components/empty-content';

const ListManagementError = React.createClass( {

	render() {
		return (
			<Main>
				<MobileBackToSidebar>
					<h1>{ this.translate( 'Manage List' ) }</h1>
				</MobileBackToSidebar>

				<EmptyContent
					title={ this.translate( 'Sorry. We can\'t find that list.' ) }
					illustration={ '/calypso/images/drake/drake-404.svg' }
					illustrationWidth={ 500 }
				/>

			</Main>
		);
	}

} );

module.exports = ListManagementError;
