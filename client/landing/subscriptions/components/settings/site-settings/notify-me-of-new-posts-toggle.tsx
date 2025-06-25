import { JetpackLogo } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type NotifyMeOfNewPostsToggleProps = {
	className?: string;
	isDisabled?: boolean;
	showJetpackAppHint?: boolean;
	toggleId?: string;
	value: boolean;
	onChange: ( value: boolean ) => void;
};

const NotifyMeOfNewPostsToggle = ( {
	className = '',
	isDisabled = false,
	showJetpackAppHint = false,
	value,
	onChange,
}: NotifyMeOfNewPostsToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className={ className }>
			<ToggleControl
				label={ translate( 'Notify me of new posts' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isDisabled }
			/>
			<p className="notify-new-posts-toggle__hint">
				{ translate( 'Receive web and mobile notifications for new posts from this site.' ) }
			</p>
			{ showJetpackAppHint && value && (
				<div className="setting-item__app-hint">
					<JetpackLogo size={ 20 } />
					<p>
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
				</div>
			) }
		</div>
	);
};

export default NotifyMeOfNewPostsToggle;
