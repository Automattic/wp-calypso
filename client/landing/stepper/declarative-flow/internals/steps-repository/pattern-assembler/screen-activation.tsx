import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { NavigatorHeader } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import './screen-activation.scss';

interface Props {
	onActivate: () => void;
}

const ScreenActivation = ( { onActivate }: Props ) => {
	const translate = useTranslate();
	const { title, description, continueLabel } = useScreen( 'activation' );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ description }
				hideBack
			/>
			<div className="screen-container__body">
				<strong className="screen-activation__heading">
					{ translate( 'Content will be replaced' ) }
				</strong>
				<p className="screen-activation__description">
					{ translate(
						'This will replace your homepage, but your content will remain accessible. {{a}}Learn more{{/a}}.',
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
				<Button className="pattern-assembler__button" primary onClick={ onActivate }>
					{ continueLabel }
				</Button>
			</div>
		</>
	);
};

export default ScreenActivation;
