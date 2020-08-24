/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { contextTypes } from '../context-types';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { Button } from '@automattic/components';

class SiteLink extends Component {
	static propTypes = {
		href: PropTypes.string,
		isButton: PropTypes.bool,
		isPrimaryButton: PropTypes.bool,
		newWindow: PropTypes.bool,
	};

	static defaultProps = {
		isButton: false,
		isPrimaryButton: true,
		newWindow: false,
	};

	static contextTypes = contextTypes;

	onClick = ( event ) => {
		this.props.onClick && this.props.onClick( event );
		const { quit, tour, tourVersion, step, isLastStep } = this.context;
		quit( { tour, tourVersion, step, isLastStep } );
	};

	render() {
		const { children, href, siteSlug, isButton, isPrimaryButton, newWindow } = this.props;
		const siteHref = href.replace( ':site', siteSlug );
		const siteTarget = newWindow ? '_blank' : null;

		if ( isButton ) {
			return (
				<Button
					primary={ isPrimaryButton }
					onClick={ this.onClick }
					href={ siteHref }
					target={ siteTarget }
				>
					{ children }
				</Button>
			);
		}

		return (
			<a onClick={ this.onClick } href={ siteHref } className="config-elements__text-link">
				{ children }
			</a>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	return { siteId, siteSlug };
};

const mapDispatchToProps = null;

export default connect( mapStateToProps, mapDispatchToProps )( SiteLink );
