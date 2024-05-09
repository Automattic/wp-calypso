import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

interface Props {
	onButtonClick: () => void;
}

export const CredentialsCta = ( props: Props ) => {
	const translate = useTranslate();
	const { onButtonClick } = props;

	return (
		<div className="pre-migration__content pre-migration__credentials">
			{ translate(
				'Want to speed up the migration?{{br/}}{{button}}Provide the server credentials{{/button}} of your site.',
				{
					components: {
						br: <br />,
						button: (
							<Button borderless className="action-buttons__borderless" onClick={ onButtonClick } />
						),
					},
				}
			) }
		</div>
	);
};
