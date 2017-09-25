/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteThemeShowcasePath } from 'state/sites/selectors';
import { recordStat } from 'lib/posts/stats';

class EditorThemeHelp extends PureComponent {
	static propTypes = {
		themeHelpPath: PropTypes.string,
		classname: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.recordClick = this.recordClick.bind( this );
	}

	recordClick() {
		recordStat( 'clicked_theme_help_link' );
	}

	render() {
		const { translate, themeHelpPath, className } = this.props;

		if ( ! themeHelpPath ) {
			return null;
		}

		return (
			<a className={ className } href={ themeHelpPath } onClick={ this.recordClick } >
				{ translate( 'Need help setting up your site?' ) }
			</a>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			themeHelpPath: getSiteThemeShowcasePath( state, siteId )
		};
	}
)( localize( EditorThemeHelp ) );
