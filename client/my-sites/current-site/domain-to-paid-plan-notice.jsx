/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import {
	get,
	noop,
} from 'lodash';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { eligibleForDomainToPaidPlanUpsell } from 'state/selectors';

export class DomainToPaidPlanNotice extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	}

	static defaultProps = {
		translate: noop,
	}

	render() {
		const { eligible, translate } = this.props;

		if ( ! eligible || abtest( 'domainToPaidPlanUpsellNudge' ) === 'skip' ) {
			return null;
		}

		return <p>{ translate( 'content' ) }</p>;
	}
}

const mapStateToProps = ( state, props ) => {
	const siteId = get( props, 'site.ID' );
	return {
		eligible: eligibleForDomainToPaidPlanUpsell( state, siteId ),
	};
};
const mapDispatchToProps = null;

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)( localize( DomainToPaidPlanNotice ) );
