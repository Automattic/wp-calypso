/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'gridicons';
import {
				getSelectedSiteSlug,
			} from 'state/ui/selectors';

class PaginationFlow extends Component {
	verifySiteIsJetpack() {
		if ( this.props.siteIsJetpack === false ) {
			this.redirectToGeneral();
		}
	}

	redirectToGeneral = () => {
		const { siteSlug } = this.props;
		page( '/settings/general/' + siteSlug );
	}

	clickHandler = ( ) => {
		this.redirectToGeneral();
	}

	render() {
		const {
			translate,
				} = this.props;
		return (
			<div className="why__pagination main">
				<Button compact borderless className="why__pagination skip" onClick={ this.clickHandler }>
					<Gridicon icon="arrow-right" size={ 18 } />
						{ translate( 'Skip Survey' ) }
				</Button>
			</div>
	);
	}
}

export default connect(
	( state ) => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( PaginationFlow ) );
