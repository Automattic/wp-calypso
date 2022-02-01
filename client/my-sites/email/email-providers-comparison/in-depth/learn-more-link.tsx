import { useTranslate } from 'i18n-calypso';
import type { LearnMoreLinkProps } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';
import type { ReactElement } from 'react';

const LearnMoreLink = ( { url }: LearnMoreLinkProps ): ReactElement => {
	const translate = useTranslate();

	return (
		<>
			{ translate( '{{a}}Learn more{{/a}}', {
				comment: 'Link to support page either for Google Workspace or Professional Email',
				components: {
					a: <a href={ url } target="_blank" rel="noopener noreferrer" />,
				},
			} ) }
		</>
	);
};

export default LearnMoreLink;
