/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { findKey, isEmpty, toLower, values } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import TokenField from 'components/token-field';
import { addQueryArgs } from 'lib/url';

class MissingFeature extends PureComponent {
	state = {
		tokens: [],
	};

	getSuggestions() {
		const { translate } = this.props;
		return {
			themes: translate( 'Themes' ),
			plugins: translate( 'Plugins' ),
			support: translate( 'Support' ),
			seo: translate( 'SEO' ),
			ads: translate( 'Ads' ),
			ecommerce: translate( 'Ecommerce' ),
		};
	}

	normalizeToken = translatedToken => {
		const tokenKey = findKey( this.getSuggestions(), token => token === translatedToken );
		if ( tokenKey ) {
			return tokenKey;
		}
		return toLower( translatedToken );
	};

	handleTokenChange = tokens => {
		this.setState( { tokens } );
	};

	render() {
		const { confirmHref, translate } = this.props;
		const suggestions = values( this.getSuggestions() );

		return (
			<div className="disconnect-site__missing-feature">
				<SectionHeader label={ translate( 'Which feature where you looking for?' ) } />
				<Card>
					<TokenField
						onChange={ this.handleTokenChange }
						suggestions={ suggestions }
						value={ this.state.tokens }
					/>
					<Button
						disabled={ isEmpty( this.state.tokens ) }
						href={ addQueryArgs(
							{ 'missing-features': this.state.tokens.map( this.normalizeToken ) },
							confirmHref
						) }
						primary
					>
						{ translate( 'Submit' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( MissingFeature );
