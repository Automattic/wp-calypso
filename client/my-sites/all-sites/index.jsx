/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import AllSitesIcon from 'my-sites/all-sites-icon';
import Count from 'components/count';
import { getSites } from 'state/selectors';
import userLib from 'lib/user';

const user = userLib();

class AllSites extends Component {
	static defaultProps = {
		onSelect: noop,
		href: null,
		isSelected: false,
		isHighlighted: false,
		showCount: true,
		domain: ''
	};

	static propTypes = {
		onSelect: React.PropTypes.func,
		href: React.PropTypes.string,
		isSelected: React.PropTypes.bool,
		isHighlighted: React.PropTypes.bool,
		showCount: React.PropTypes.bool,
		count: React.PropTypes.number,
		title: React.PropTypes.string,
		domain: React.PropTypes.string,
		onMouseEnter: React.PropTypes.func,
		onMouseLeave: React.PropTypes.func
	};

	onSelect( event ) {
		this.props.onSelect( event );
	}

	renderSiteCount() {
		const count = this.props.count || user.get().visible_site_count;
		return <Count count={ count } />;
	}

	render() {
		const { title, href, domain, sites, translate, isHighlighted, isSelected, showCount } = this.props;
		const allSitesClass = classNames( {
			'all-sites': true,
			'is-selected': isSelected,
			'is-highlighted': isHighlighted
		} );

		return (
			<div className={ allSitesClass }>
				<a
					className="site__content"
					href={ href }
					onMouseEnter={ this.props.onMouseEnter }
					onMouseLeave={ this.props.onMouseLeave }
					onClick={ this.onSelect }>
					{ showCount && this.renderSiteCount() }
					<div className="site__info">
						<span className="site__title">{ title || translate( 'All My Sites' ) }</span>
						{ domain && <span className="site__domain">{ domain }</span> }
						<AllSitesIcon sites={ sites } />
					</div>
				</a>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		sites: getSites( state )
	} )
)( localize( AllSites ) );
