/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent, createRef, useState, useEffect } from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import VerticalSelect from './vertical-select';
import SiteTitle from './site-title';
import { Step, usePath } from '../../path';
import Link from '../../components/link';

import './style.scss';

const AcquireIntent: FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const { siteVertical, siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const makePath = usePath();
	const siteTitleRef = createRef< HTMLInputElement >();

	const [ siteTitleActive, setSiteTitleActive ] = useState( false );

	useEffect( () => {
		if ( siteTitleActive ) {
			siteTitleRef.current?.focus();
		}
	}, [ siteTitleActive, siteTitleRef ] );

	const handleVerticalSubmit = () => {
		setSiteTitleActive( true );
	};

	return (
		<div className="acquire-intent">
			<div className="acquire-intent__questions">
				<VerticalSelect onSubmit={ handleVerticalSubmit } />
				{ ( siteVertical || siteTitle ) && <SiteTitle inputRef={ siteTitleRef } /> }
				{ siteVertical && (
					<div className="acquire-intent__footer">
						<Link
							className="acquire-intent__question-skip"
							isPrimary
							to={ makePath( Step.DesignSelection ) }
						>
							{ /* @TODO: add transitions and correct action */ }
							{ siteTitle ? NO__( 'Choose a design' ) : NO__( 'Donʼt know yet' ) }
						</Link>
					</div>
				) }
			</div>
		</div>
	);
};

export default AcquireIntent;
