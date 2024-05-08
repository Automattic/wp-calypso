import config from '@automattic/calypso-config';
import { Count } from '@automattic/components';
import styled from '@emotion/styled';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	getCurrentUserJetpackVisibleSiteCount,
	getCurrentUserVisibleSiteCount,
} from 'calypso/state/current-user/selectors';
import getSites from 'calypso/state/selectors/get-sites';

import './style.scss';

const noop = () => {};

const IconContainer = styled.div( {
	alignItems: 'center',
	alignSelf: 'center',
	borderRadius: 0,
	display: 'inline-flex',
	marginInlineEnd: '8px',
	padding: 0,
	height: '32px',
	width: '32px',
	justifyContent: 'center',
	color: 'var(--color-sidebar-text)',
} );

class AllSites extends Component {
	static defaultProps = {
		onSelect: noop,
		href: null,
		isSelected: false,
		isHighlighted: false,
		showCount: true,
		showIcon: false,
		showChevronDownIcon: false,
		domain: '',
	};

	static propTypes = {
		onSelect: PropTypes.func,
		href: PropTypes.string,
		isSelected: PropTypes.bool,
		isHighlighted: PropTypes.bool,
		showCount: PropTypes.bool,
		showIcon: PropTypes.bool,
		showChevronDownIcon: PropTypes.bool,
		count: PropTypes.number,
		icon: PropTypes.node,
		title: PropTypes.string,
		domain: PropTypes.string,
		onMouseEnter: PropTypes.func,
		onMouseLeave: PropTypes.func,
	};

	onSelect = ( event ) => {
		this.props.onSelect( event );
	};

	renderIcon() {
		if ( ! this.props.icon ) {
			return null;
		}

		return <IconContainer className="all-sites__icon-container">{ this.props.icon }</IconContainer>;
	}

	renderSiteCount() {
		return <Count count={ this.props.count } />;
	}

	render() {
		const {
			title,
			href,
			domain,
			translate,
			isHighlighted,
			isSelected,
			showCount,
			showIcon,
			showChevronDownIcon,
		} = this.props;

		// Note: Update CSS selectors in SiteSelector.scrollToHighlightedSite() if the class names change.
		const allSitesClass = clsx( {
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
					{ showIcon && this.renderIcon() }
					<div className="all-sites__info site__info">
						<span className="all-sites__title site__title">
							{ title || translate( 'All sites' ) }
							{ showChevronDownIcon && (
								<Icon icon={ chevronDown } className="all-sites__title-chevron-icon" size={ 24 } />
							) }
						</span>
						{ domain && <span className="all-sites__domain site__domain">{ domain }</span> }
					</div>
				</a>
			</div>
		);
	}
}

// don't instantiate function in `connect`
const isSiteVisible = ( { visible = true } ) => visible;

export default connect( ( state, props ) => {
	// An explicit `count` prop overrides everything,
	// but only if it's present and valid.
	//
	// (NOTE: As of 2023-06-07, `count` is not explicitly defined
	// in any usage of AllSites.)
	if ( Number.isInteger( props.count ) && props.count >= 0 ) {
		return { count: props.count };
	}

	// If the "realtime-site-count" feature flag is enabled,
	// filter the full list of sites by their visibility at runtime.
	if ( config.isEnabled( 'realtime-site-count' ) ) {
		const visibleSites = getSites( state )?.filter( isSiteVisible );
		return { count: visibleSites.length };
	}

	// Jetpack Cloud only ever accounts for Jetpack sites
	if ( isJetpackCloud() ) {
		return { count: getCurrentUserJetpackVisibleSiteCount( state ) };
	}

	// Under any other condition, return the value of the current user's
	// `visible_site_count` property
	return { count: getCurrentUserVisibleSiteCount( state ) };
} )( localize( AllSites ) );
