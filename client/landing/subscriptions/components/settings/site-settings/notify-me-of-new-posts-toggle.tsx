import { JetpackLogo } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type NotifyMeOfNewPostsToggleProps = {
	value: boolean;
	isUpdating: boolean;
	onChange: ( value: boolean ) => void;
};

const NotifyMeOfNewPostsToggle = ( {
	value = false,
	isUpdating = false,
	onChange,
}: NotifyMeOfNewPostsToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className="setting-item">
			<ToggleControl
				label={ translate( 'Receive web and mobile notifications' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isUpdating }
			/>
			{ value && (
				<p className="setting-item__app-hint">
					<JetpackLogo size={ 20 } />
					{ translate(
						'Take your subscriptions on the go with the {{a}}Jetpack mobile app{{/a}}.',
						{
							components: {
								a: (
									<a
										href="https://wp.com/app/?campaign=calypso-subscription-link"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			) }
		</div>
	);
};

export default NotifyMeOfNewPostsToggle;
