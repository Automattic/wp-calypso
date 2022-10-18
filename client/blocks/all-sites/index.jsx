import config from '@automattic/calypso-config';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Count from 'calypso/components/count';
import { getCurrentUserVisibleSiteCount } from 'calypso/state/current-user/selectors';
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
		domain: '',
	};

	static propTypes = {
		onSelect: PropTypes.func,
		href: PropTypes.string,
		isSelected: PropTypes.bool,
		isHighlighted: PropTypes.bool,
		showCount: PropTypes.bool,
		showIcon: PropTypes.bool,
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
		return <IconContainer>{ this.props.icon }</IconContainer>;
	}

	renderSiteCount() {
		return <Count count={ this.props.count } />;
	}

	render() {
		const { title, href, domain, translate, isHighlighted, isSelected, showCount, showIcon } =
			this.props;

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
					{ showIcon && this.renderIcon() }
					<div className="all-sites__info site__info">
						<span className="all-sites__title site__title">
							{ title || translate( 'All My Sites' ) }
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
	const visibleSites = getSites( state )?.filter( isSiteVisible );
	const userSitesCount = props.count ?? getCurrentUserVisibleSiteCount( state );

	return {
		count: config.isEnabled( 'realtime-site-count' ) ? visibleSites.length : userSitesCount,
	};
} )( localize( AllSites ) );
