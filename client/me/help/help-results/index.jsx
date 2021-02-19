/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import HelpResult from './item';

/**
 * Style dependencies
 */
import './style.scss';

export default class extends React.PureComponent {
	static displayName = 'HelpResults';

	render() {
		if ( ! this.props.helpLinks.length ) {
			return null;
		}

		return (
			<>
				{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
				<h2 className="help__section-title">{ this.props.header }</h2>
				<div className="help-results">
					{ this.props.helpLinks.map( ( helpLink ) => (
						<HelpResult
							key={ helpLink.link }
							helpLink={ helpLink }
							iconTypeDescription={ this.props.iconTypeDescription }
							onClick={ this.props.onClick }
						/>
					) ) }
					<a href={ this.props.searchLink } target="__blank">
						<CompactCard className="help-results__footer">
							<span className="help-results__footer-text">{ this.props.footer }</span>
						</CompactCard>
					</a>
				</div>
			</>
		);
	}
}
