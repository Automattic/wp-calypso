/** @format */

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

class DomainSuggestionsExample extends React.Component {
	static propTypes = {
		mapDomainUrl: PropTypes.string.isRequired,
	};

	render() {
		const { translate, siteDesignType } = this.props;

		const showDomainMappingOption = siteDesignType !== DESIGN_TYPE_STORE;

		/* eslint-disable max-len */
		return (
			<div className="example-domain-suggestions">
				<p className="example-domain-suggestions__explanation">
					{ translate(
						'A domain name is what people type into their browser to visit your site.'
					) }
				</p>
				{ showDomainMappingOption && (
					<p className="example-domain-suggestions__mapping-information">
						<a onClick={ this.props.recordClick } href={ this.props.mapDomainUrl }>
							{ translate( 'Already own a domain?' ) }
						</a>
					</p>
				) }
				<div className="example-domain-suggestions__browser">
					<svg width="295" height="102" viewBox="0 0 295 102" xmlns="http://www.w3.org/2000/svg">
						<title>Example Browser</title>
						<g fill="none" fillRule="evenodd">
							<path fill="#E9EFF3" d="M0 49h295v53H0z" />
							<path d="M295 50V0H8.005C3.585 0 0 3.576 0 8.006V50h295z" fill="#C8D7E1" />
							<rect fill="#E9EFF3" opacity=".8" x="10" y="10" width="30" height="30" rx="4" />
							<rect fill="#E9EFF3" opacity=".8" x="50" y="10" width="30" height="30" rx="4" />
							<path
								d="M295 10H94c-2.21 0-4 1.79-4 4v22c0 2.213 1.79 4 4 4h201V10z"
								fill="#F3F6F8"
							/>
							<path
								d="M102.26 30h1.26v-4.673c0-1.333.776-2.226 2.19-2.226 1.193 0 1.823.696 1.823 2.095V30h1.26v-5.112c0-1.853-1.055-2.923-2.725-2.923-1.208 0-2.036.513-2.43 1.385h-.118v-4.38h-1.26V30zm9.36-9.94v2.044h-1.274v1.055h1.274v4.79c0 1.508.652 2.11 2.278 2.11.25 0 .49-.03.74-.075v-1.062c-.235.022-.36.03-.586.03-.82 0-1.172-.396-1.172-1.326V23.16h1.758v-1.056h-1.758V20.06h-1.26zm5.45 0v2.044h-1.275v1.055h1.274v4.79c0 1.508.65 2.11 2.277 2.11.25 0 .49-.03.74-.075v-1.062c-.234.022-.36.03-.586.03-.82 0-1.17-.396-1.17-1.326V23.16h1.757v-1.056h-1.758V20.06h-1.26zm8.766 1.905c-1.076 0-2.02.55-2.526 1.458h-.118v-1.32h-1.2v10.534h1.26v-3.824h.116c.432.835 1.34 1.326 2.468 1.326 2.007 0 3.318-1.62 3.318-4.088 0-2.483-1.303-4.087-3.318-4.087zm-.3 7.04c-1.42 0-2.322-1.144-2.322-2.953 0-1.816.9-2.95 2.33-2.95 1.442 0 2.307 1.105 2.307 2.95 0 1.846-.864 2.952-2.314 2.952zm6.636 1.068c.527 0 .952-.432.952-.952 0-.526-.425-.95-.952-.95-.52 0-.952.424-.952.95 0 .52.432.953.952.953zm0-5.632c.527 0 .952-.43.952-.95 0-.53-.425-.953-.952-.953-.52 0-.952.424-.952.952 0 .52.432.95.952.95zm3.765 7.94l3.237-12.95h-1.113l-3.222 12.95h1.1zm5.214 0l3.24-12.95h-1.115l-3.222 12.95h1.098z"
								fill="#87A6BC"
							/>
							<path
								d="M150.336 23.08c1.252 0 2.087.92 2.117 2.32h-4.35c.094-1.4.973-2.32 2.233-2.32zm2.08 4.877c-.33.695-1.018 1.07-2.036 1.07-1.34 0-2.212-.99-2.278-2.55v-.06h5.676v-.482c0-2.454-1.296-3.97-3.427-3.97-2.167 0-3.56 1.612-3.56 4.095 0 2.497 1.37 4.08 3.56 4.08 1.73 0 2.945-.828 3.326-2.183h-1.26zm6.138-.938L160.42 30h1.496l-2.718-4 2.68-3.896h-1.427l-1.852 2.938h-.118l-1.875-2.938h-1.5l2.73 3.948L155.134 30h1.43l1.874-2.98h.117zm7.514 2.013c-.915 0-1.596-.47-1.596-1.274 0-.792.527-1.21 1.728-1.29l2.124-.14v.726c0 1.128-.96 1.977-2.256 1.977zm-.234 1.106c1.055 0 1.92-.462 2.432-1.305h.117V30h1.2v-5.405c0-1.64-1.076-2.63-3.002-2.63-1.684 0-2.93.835-3.097 2.102h1.274c.176-.622.835-.98 1.78-.98 1.18 0 1.787.534 1.787 1.508v.718l-2.278.14c-1.838.11-2.878.922-2.878 2.335 0 1.443 1.135 2.35 2.666 2.35zm6.08-.14h1.26v-4.893c0-1.113.797-2.006 1.83-2.006.996 0 1.648.6 1.648 1.54V30h1.26v-5.076c0-1.003.732-1.823 1.83-1.823 1.114 0 1.663.572 1.663 1.736V30h1.26v-5.457c0-1.655-.9-2.578-2.512-2.578-1.09 0-1.992.55-2.417 1.385h-.117c-.368-.82-1.115-1.385-2.184-1.385-1.055 0-1.846.506-2.205 1.385h-.116v-1.246h-1.2V30zm16.896-8.035c-1.077 0-2.02.55-2.527 1.458h-.117v-1.32h-1.2v10.534h1.26v-3.824h.116c.432.835 1.34 1.326 2.468 1.326 2.007 0 3.318-1.62 3.318-4.088 0-2.483-1.304-4.087-3.318-4.087zm-.3 7.04c-1.42 0-2.322-1.144-2.322-2.953 0-1.816.9-2.95 2.33-2.95 1.442 0 2.306 1.105 2.306 2.95 0 1.846-.864 2.952-2.314 2.952zm5.67.995h1.258V18.97h-1.26V30zm6.854-6.92c1.253 0 2.088.92 2.117 2.32h-4.35c.096-1.4.974-2.32 2.234-2.32zm2.08 4.877c-.33.695-1.018 1.07-2.036 1.07-1.34 0-2.212-.99-2.278-2.55v-.06h5.677v-.482c0-2.454-1.297-3.97-3.428-3.97-2.17 0-3.56 1.612-3.56 4.095 0 2.497 1.37 4.08 3.56 4.08 1.727 0 2.943-.828 3.324-2.183h-1.26zm4.38 2.116c.527 0 .952-.432.952-.952 0-.526-.425-.95-.952-.95-.52 0-.952.424-.952.95 0 .52.432.953.952.953zm9.946-5.552c-.22-1.405-1.39-2.555-3.31-2.555-2.212 0-3.618 1.597-3.618 4.058 0 2.512 1.413 4.116 3.625 4.116 1.897 0 3.076-1.07 3.303-2.52h-1.274c-.234.893-.974 1.384-2.036 1.384-1.406 0-2.315-1.157-2.315-2.98 0-1.788.894-2.923 2.315-2.923 1.135 0 1.83.638 2.036 1.42h1.274zm5.105 4.484c-1.494 0-2.336-1.084-2.336-2.952 0-1.875.84-2.95 2.335-2.95s2.337 1.075 2.337 2.95c0 1.868-.842 2.952-2.337 2.952zm0 1.135c2.25 0 3.64-1.554 3.64-4.088 0-2.54-1.39-4.087-3.64-4.087-2.248 0-3.64 1.546-3.64 4.087 0 2.534 1.392 4.087 3.64 4.087zm5.618-.14h1.26v-4.893c0-1.113.798-2.006 1.83-2.006.997 0 1.65.6 1.65 1.54V30h1.26v-5.076c0-1.003.73-1.823 1.83-1.823 1.113 0 1.662.572 1.662 1.736V30h1.26v-5.457c0-1.655-.9-2.578-2.512-2.578-1.09 0-1.992.55-2.417 1.385h-.117c-.368-.82-1.115-1.385-2.184-1.385-1.055 0-1.846.506-2.205 1.385h-.116v-1.246h-1.2V30z"
								fill="#3D596D"
							/>
						</g>
					</svg>
				</div>
			</div>
		);
		/* eslint-enable max-len */
	}
}

const recordClick = () =>
	recordTracksEvent( 'calypso_example_domain_suggestions_mapping_link_click' );

export default connect(
	state => ( {
		siteDesignType: getDesignType( state ),
	} ),
	{
		recordClick,
	}
)( localize( DomainSuggestionsExample ) );
