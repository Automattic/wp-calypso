import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import Main from 'calypso/components/main';
import './style.scss';

interface Props {
	authUrl: string;
}

const Connect: FunctionComponent< Props > = ( { authUrl } ) => {
	const translate = useTranslate();

	return (
		<Main className="connect">
			<div className="connect__content">
				<p>
					{ translate(
						'Welcome to the Automattic Partner Portal. Authorize with your WordPress.com credentials to get started.'
					) }
				</p>
				<Button primary href={ authUrl }>
					{ translate( 'Authorize Automattic Partner Portal' ) }
				</Button>
			</div>
		</Main>
	);
};

export default Connect;
