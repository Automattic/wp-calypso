import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactNode } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';

interface Props {
	children: ReactNode;
	subtitle?: string;
}

export const CardContentWrapper: FunctionComponent< Props > = ( { children, subtitle } ) => {
	const translate = useTranslate();
	return (
		<>
			<NavigationHeader
				title={ translate( 'Staging site' ) }
				subtitle={
					subtitle ||
					translate(
						'Preview and troubleshoot changes before updating your production site. {{a}}Learn more{{/a}}',
						{
							components: {
								a: <InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />,
							},
						}
					)
				}
			/>
			{ children }
		</>
	);
};
