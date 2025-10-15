import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PropsWithChildren } from 'react';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';

import './style.scss';

export const Layout = ( { children }: PropsWithChildren ) => {
	return (
		<PageLayout
			header={
				<PageHeader
					actions={
						<>
							<Button className="emails__add-email-forwarder" variant="link" __next40pxDefaultSize>
								{ __( 'Add email forwarder' ) }
							</Button>
							<Button variant="primary" __next40pxDefaultSize>
								{ __( 'Add mailbox' ) }
							</Button>
						</>
					}
				/>
			}
			notices={ <OptInWelcome tracksContext="emails" /> }
		>
			{ children }
		</PageLayout>
	);
};
