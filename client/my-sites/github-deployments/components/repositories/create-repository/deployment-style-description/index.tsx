import { Spinner } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-yaml';
import { useEffect, useRef } from 'react';
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

	const yamlCodeRef = useRef< HTMLElement | null >( null );

	useEffect( () => {
		if ( yamlCodeRef.current ) {
			Prism.highlightElement( yamlCodeRef.current );
		}
	}, [ data?.content ] );

	const renderContent = () => {
		if ( ! data?.content ) {
			return <span>{ __( 'The selected template does not require file processing' ) }</span>;
		}

		return (
			<div>
				<p>{ __( 'The following workflow file is included with this template:' ) }</p>
				<pre>
					<code ref={ yamlCodeRef } className="language-yaml">
						{ data.content }
					</code>
				</pre>
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
