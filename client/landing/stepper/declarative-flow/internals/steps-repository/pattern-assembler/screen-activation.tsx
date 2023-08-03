import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { NavigatorHeader } from '@automattic/onboarding';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import NavigatorTitle from './navigator-title';
import './screen-activation.scss';

interface Props {
	onActivate: () => void;
}

const ScreenActivation = ( { onActivate }: Props ) => {
	const translate = useTranslate();
	const [ isConfirmed, setIsConfirmed ] = useState( false );
	const toggleConfirm = () => setIsConfirmed( ( value ) => ! value );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Activate this theme' ) } /> }
				description={ translate( 'Activating this theme will result in the following changes.' ) }
				hideBack
			/>
			<div className="screen-container__body">
				<strong className="screen-activation__heading">
					{ translate( 'Content will be replaced' ) }
				</strong>
				<p className="screen-activation__description">
					{ translate(
						'After activation, this layout will replace your existing homepage. But you can still access your old content. {{a}}Learn more{{/a}}.',
						{
							components: {
								a: (
									<a
										href={ localizeUrl( 'https://wordpress.com/support/themes/changing-themes' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			</div>
			<div className="screen-container__footer">
				<CheckboxControl
					className="screen-activation__checkbox"
					label={ translate( 'I understand that this layout will replace my existing homepage.' ) }
					checked={ isConfirmed }
					onChange={ toggleConfirm }
				/>
				<Button
					className="pattern-assembler__button"
					primary
					disabled={ ! isConfirmed }
					aria-disabled={ ! isConfirmed }
					onClick={ onActivate }
				>
					{ translate( 'Activate' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenActivation;
