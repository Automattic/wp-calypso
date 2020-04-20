/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { isArray } from 'lodash';

/**
 * Internal Dependencies
 */
import ActionButtons from './actions';
import { Button } from '@automattic/components';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import SiteIcon from 'blocks/site-icon';

class ActionHeader extends React.Component {
	static propTypes = {
		breadcrumbs: PropTypes.node,
		primaryLabel: PropTypes.string,
		setLayoutFocus: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
	};

	toggleSidebar = ( event ) => {
		event.preventDefault();
		this.props.setLayoutFocus( 'sidebar' );
	};

	renderBreadcrumbs = () => {
		const { breadcrumbs } = this.props;
		let breadcrumbsOutput = breadcrumbs;
		if ( isArray( breadcrumbs ) ) {
			breadcrumbsOutput = breadcrumbs.map( ( crumb, i ) => <span key={ i }>{ crumb }</span> );
		}

		return <div className="action-header__breadcrumbs">{ breadcrumbsOutput }</div>;
	};

	render() {
		const { children, primaryLabel, site } = this.props;

		return (
			<header className="action-header">
				<Button
					borderless
					onClick={ this.toggleSidebar }
					className="action-header__back-to-sidebar"
				>
					<Gridicon icon="chevron-left" />
				</Button>
				<div className="action-header__content">
					<a href={ site.URL } aria-label={ site.title }>
						<SiteIcon site={ site } />
					</a>
					<div className="action-header__details">
						{ site && <p className="action-header__site-title">{ site.title }</p> }
						{ this.renderBreadcrumbs() }
					</div>
				</div>
				<ActionButtons primaryLabel={ primaryLabel }>{ children }</ActionButtons>
			</header>
		);
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSiteWithFallback( state ),
	} ),
	{ setLayoutFocus }
)( ActionHeader );
