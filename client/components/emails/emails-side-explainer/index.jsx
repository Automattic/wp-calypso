/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 *  Internal dependencies
 */
import checkmark from './checkmark';
import { Icon } from '@wordpress/icons';

/**
 * Style dependencies
 */
import './style.scss';

class EmailSideExplainer extends React.Component {
	getStrings() {
		const { translate } = this.props;

		const title = translate(
			'{{b}}75%{{/b}} of U.S. e-commerce customers prefer to trust a business with a custom email',
			{
				components: { b: <strong /> },
			}
		);
		const subtitle = (
			<>
				<p>
					<Icon icon={ checkmark } size={ 16 } />
					{ `${ translate( 'Stand out with every email you send' ) }` }
				</p>
				<p>
					<Icon icon={ checkmark } size={ 16 } />
					{ `${ translate( 'Single dashboard for your email, domain and website' ) }` }
				</p>
				<p>
					<Icon icon={ checkmark } size={ 16 } />
					{ `${ translate( 'Easy to import your existing emails and contacts' ) }` }
				</p>
			</>
		);

		return { title, subtitle };
	}

	render() {
		const { title, subtitle } = this.getStrings();

		return (
			/* eslint-disable jsx-a11y/click-events-have-key-events */
			<div className="email-side-explainer">
				<div className="email-side-explainer__title">{ title }</div>
				<div className="email-side-explainer__subtitle">{ subtitle }</div>
			</div>
			/* eslint-enable jsx-a11y/click-events-have-key-events */
		);
	}
}

export default localize( EmailSideExplainer );
