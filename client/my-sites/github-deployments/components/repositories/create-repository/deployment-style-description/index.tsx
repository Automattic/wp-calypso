import { Spinner } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { CodeHighlighter } from '../../../code-highlighter';
import { useGetWorkflowContents } from '../../../deployment-style/use-get-workflow-contents-query';

import './style.scss';

interface DeploymentStyleDescriptionProps {
	repositoryName: string;
	branchName: string;
	workflowFilename?: string;
}

export const DeploymentStyleDescription = ( {
	repositoryName,
	branchName,
	workflowFilename,
}: DeploymentStyleDescriptionProps ) => {
	const { __ } = useI18n();

	const { data, isLoading } = useGetWorkflowContents(
		{
			repositoryOwner: 'Automattic',
			repositoryName,
			branchName,
			workflowFilename,
		},
		{
			enabled: !! workflowFilename,
		}
	);

	const renderContent = () => {
		if ( ! data?.content ) {
			return <span>{ __( 'The selected template does not require file processing' ) }</span>;
		}

		return (
			<div className="deployment-style-description__workflow">
				<p>{ __( 'The following workflow file is included with this template:' ) }</p>
				<CodeHighlighter content={ data.content } />
			</div>
		);
	};

	return (
		<div className="deployment-style-description">
			<h3 className="deployment-style-description__header">
				{ __( 'File processing' ) }
				{ isLoading && <Spinner /> }
			</h3>
			{ isLoading ? null : <div css={ { marginTop: '16px' } }>{ renderContent() }</div> }
		</div>
	);
};
