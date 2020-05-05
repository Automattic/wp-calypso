/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { DESIGN_TYPE_STORE } from 'signup/constants';
import ExampleDomainBrowser from '../example-domain-browser';

/**
 * Style dependencies
 */
import './style.scss';

class DomainSuggestionsExample extends React.Component {
	static propTypes = {
		offerUnavailableOption: PropTypes.bool,
		siteDesignType: PropTypes.string,
		url: PropTypes.string.isRequired,
	};

	render() {
		const { translate, siteDesignType } = this.props;

		const showDomainOption =
			this.props.offerUnavailableOption && siteDesignType !== DESIGN_TYPE_STORE;

		return (
			<div className="example-domain-suggestions">
				<p className="example-domain-suggestions__explanation">
					{ translate(
						'A domain name is the site address people type into their browser to visit your site.'
					) }
				</p>
				{ showDomainOption && (
					<p className="example-domain-suggestions__mapping-information">
						<a onClick={ this.props.recordClick } href={ this.props.url }>
							{ translate( 'Already own a domain?' ) }
						</a>
					</p>
				) }
				<ExampleDomainBrowser className="example-domain-suggestions__browser" />
			</div>
		);
	}
}

const recordClick = () => recordTracksEvent( 'calypso_example_domain_suggestions_link_click' );

export default connect(
	( state ) => ( {
		siteDesignType: getDesignType( state ),
	} ),
	{
		recordClick,
	}
)( localize( DomainSuggestionsExample ) );
