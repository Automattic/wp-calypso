/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';
import Link from '../../components/link';
import VerticalSelect from './vertical-select';
import SiteTitle from './site-title';
import './style.scss';

const AcquireIntent: FunctionComponent = () => {
	const { __ } = useI18n();
	const { siteVertical, siteTitle } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const makePath = usePath();

	return (
		<div className="gutenboarding-page acquire-intent">
			<div className="acquire-intent__questions">
				<VerticalSelect />
				{ /* We are rendering everything to keep the content vertically centered on desktop while preventing jumping */ }
				<SiteTitle isVisible={ !! ( siteVertical || siteTitle ) } />
				<div
					className={ classnames( 'acquire-intent__footer', {
						'acquire-intent__footer--hidden': ! siteVertical,
					} ) }
				>
					<Link
						className="acquire-intent__question-skip"
						isPrimary
						to={ siteVertical && makePath( Step.DesignSelection ) }
					>
						{ /* @TODO: add transitions and correct action */ }
						{ siteTitle ? __( 'Choose a design' ) : __( 'Donʼt know yet' ) }
					</Link>
				</div>
			</div>
		</div>
	);
};

export default AcquireIntent;
