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
import Button from 'client/components/button';
import Card from 'client/components/card';
import SectionHeader from 'client/components/section-header';
import TokenField from 'client/components/token-field';
import { addQueryArgs } from 'client/lib/url';

class MissingFeature extends PureComponent {
	state = {
		tokens: [],
	};

	getSuggestions() {
		const { translate } = this.props;
		return {
			themes: translate( 'Themes' ),
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
				<SectionHeader label={ translate( 'Which feature(s) were you looking for?' ) } />
				<Card>
					<TokenField
						onChange={ this.handleTokenChange }
						suggestions={ suggestions }
						value={ this.state.tokens }
					/>
					<Button
						disabled={ isEmpty( this.state.tokens ) }
						href={
							! isEmpty( this.state.tokens )
								? addQueryArgs(
										{
											reason: 'missing-feature',
											text: this.state.tokens.map( this.normalizeToken ).sort(),
										},
										confirmHref
									)
								: null
						}
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
