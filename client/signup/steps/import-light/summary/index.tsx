import { SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { check } from 'calypso/signup/icons';
import type * as React from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const Scanning: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className="import-layout__center import-light__summary">
			<div className="import__heading-center">
				<Icon icon={ check } />
				<Title>{ __( 'Wonderful!' ) }</Title>
				<SubTitle>
					{ createInterpolateElement(
						sprintf(
							/* translators: the colorsNum could be any number from 0 to about ~10 */
							__( 'We imported<br /><span>%(colorsNum)s color swatches.</span>' ),
							{ colorsNum: 4 }
						),
						{
							br: createElement( 'br' ),
							span: createElement( 'span' ),
						}
					) }
				</SubTitle>
			</div>
		</div>
	);
};

export default Scanning;
