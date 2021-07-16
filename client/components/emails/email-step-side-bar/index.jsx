/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Icon } from '@wordpress/icons';

/**
 * Style dependencies
 */
import './style.scss';
import Gridicon from "calypso/components/gridicon";

class EmailStepSideBar extends React.Component {
	getExplainers() {
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
					<Gridicon icon="checkmark" size={ 16 } />
					{ `${ translate( 'Stand out with every email you send' ) }` }
				</p>
				<p>
					<Gridicon icon="checkmark" size={ 16 } />
					{ `${ translate( 'Single dashboard for your email, domain and website' ) }` }
				</p>
				<p>
					<Gridicon icon="checkmark" size={ 16 } />
					{ `${ translate( 'Easy to import your existing emails and contacts' ) }` }
				</p>
			</>
		);

		return { title, subtitle };
	}

	render() {
		const { title, subtitle } = this.getExplainers();

		return (
			<div className="email-side-explainer">
				<div className="email-side-explainer__title">{ title }</div>
				<div className="email-side-explainer__subtitle">{ subtitle }</div>
			</div>
		);
	}
}

export default localize( EmailStepSideBar );
