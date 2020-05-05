/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import AllSitesIcon from './all-sites-icon';
import Count from 'components/count';
import getSites from 'state/selectors/get-sites';
import { getCurrentUserVisibleSiteCount } from 'state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class AllSites extends Component {
	static defaultProps = {
		onSelect: noop,
		href: null,
		isSelected: false,
		isHighlighted: false,
		showCount: true,
		domain: '',
	};

	static propTypes = {
		onSelect: PropTypes.func,
		href: PropTypes.string,
		isSelected: PropTypes.bool,
		isHighlighted: PropTypes.bool,
		showCount: PropTypes.bool,
		count: PropTypes.number,
		title: PropTypes.string,
		domain: PropTypes.string,
		onMouseEnter: PropTypes.func,
		onMouseLeave: PropTypes.func,
	};

	onSelect = ( event ) => {
		this.props.onSelect( event );
	};

	renderSiteCount() {
		return <Count count={ this.props.count } />;
	}

	render() {
		const {
			title,
			href,
			domain,
			sites,
			translate,
			isHighlighted,
			isSelected,
			showCount,
		} = this.props;

		// Note: Update CSS selectors in SiteSelector.scrollToHighlightedSite() if the class names change.
		const allSitesClass = classNames( {
			'all-sites': true,
			'is-selected': isSelected,
			'is-highlighted': isHighlighted,
		} );

		return (
			<div className={ allSitesClass }>
				<a
					className="all-sites__content site__content"
					href={ href }
					onMouseEnter={ this.props.onMouseEnter }
					onMouseLeave={ this.props.onMouseLeave }
					onClick={ this.onSelect }
				>
					{ showCount && this.renderSiteCount() }
					<div className="all-sites__info site__info">
						<span className="all-sites__title site__title">
							{ title || translate( 'All My Sites' ) }
						</span>
						{ domain && <span className="all-sites__domain site__domain">{ domain }</span> }
						<AllSitesIcon sites={ sites } />
					</div>
				</a>
			</div>
		);
	}
}

export default connect( ( state, props ) => {
	// If sites or count are not specified as props, fetch the default values from Redux
	const { sites = getSites( state ), count = getCurrentUserVisibleSiteCount( state ) } = props;
	return { sites, count };
} )( localize( AllSites ) );
