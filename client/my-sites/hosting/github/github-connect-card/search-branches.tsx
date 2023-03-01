import { Spinner } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useGithubBranchesQuery } from './use-github-branches-query';

interface SearchBranchesProps {
	siteId: number | null;
	connectionId: number;
	onSelect( repo: string ): void;
	repoName?: string;
	selectedBranch?: string;
}

export const SearchBranches = ( {
	siteId,
	connectionId,
	onSelect,
	repoName,
	selectedBranch,
}: SearchBranchesProps ) => {
	const { __ } = useI18n();

	const { data: branches, isFetching } = useGithubBranchesQuery( siteId, repoName, connectionId, {
		onSuccess( branches ) {
			if ( branches.length < 30 ) {
				onSelect( branches[ 0 ] );
			}
		},
	} );

	if ( ! repoName || isFetching ) {
		return (
			<div style={ { position: 'relative' } }>
				<FormTextInput
					id="branch"
					disabled={ ! repoName || isFetching }
					className="connect-branch__repository-field"
					placeholder={ branches ? __( 'Type a branch' ) : __( 'Choose a branch' ) }
					onChange={ ( e: ChangeEvent< HTMLInputElement > ) => onSelect( e.target.value ) }
					value={ selectedBranch }
				/>
				{ isFetching && <Spinner className="connect-branch__loading" /> }
			</div>
		);
	}

	if ( branches && branches.length > 0 && branches.length < 30 ) {
		return (
			<FormSelect
				id="branch"
				className="connect-branch__field"
				placeholder={ __( 'Select a branch' ) }
				value={ selectedBranch }
				onChange={ ( e: ChangeEvent< HTMLSelectElement > ) => onSelect( e.target.value ) }
			>
				{ branches.map( ( branch ) => (
					<option key={ branch } value={ branch }>
						{ branch }
					</option>
				) ) }
			</FormSelect>
		);
	}

	return (
		<FormTextInput
			id="branch"
			disabled
			className="connect-branch__repository-field"
			placeholder={ __( 'No branches found' ) }
			value=""
		/>
	);
};
