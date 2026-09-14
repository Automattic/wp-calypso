import { localizeUrl } from '@automattic/i18n-utils';
import {
	ButtonRow,
	makeTour,
	Quit,
	Link,
	Step,
	Tour,
} from 'calypso/layout/guided-tours/config-elements';
import meta from './meta';

const CONNECT_BUTTON_SELECTOR = '.sharing-service.not-connected .button.is-compact';

const handleDisappear = ( { quit } ) => quit();

export const marketingConnectionsTour = makeTour(
	<Tour { ...meta }>
		<Step
			arrow="right-middle"
			name="init"
			placement="left"
			style={ {
				marginLeft: '-24px',
			} }
			waitForTarget
			target={ CONNECT_BUTTON_SELECTOR }
			onTargetDisappear={ handleDisappear }
			keepRepositioning
		>
			{ ( { translate } ) => (
				<>
					<p>
						{ translate(
							"Select the service which you'd like to connect. " +
								'Whenever you publish a new post, your social media followers will receive an update.'
						) }
					</p>
					<ButtonRow>
						<Link
							supportArticleId={ 4789 }
							href={ localizeUrl( 'https://wordpress.com/support/publicize/' ) }
						>
							{ translate( 'Learn more' ) }
						</Link>
						<Quit primary>{ translate( 'Got it' ) }</Quit>
					</ButtonRow>
				</>
			) }
		</Step>
	</Tour>
);
