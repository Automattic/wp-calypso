import { useQuery, useQueryClient, useMutation } from 'react-query';
import wpcom from 'calypso/lib/wp';

const withExternalContributors = ( Component ) => ( props ) => {
	const queryClient = useQueryClient();
	const { siteId, forceSync } = props;

	// Grab data
	const { data, error, isLoading } = useQuery(
		`externalContributors-${ siteId }`,
		() =>
			wpcom.req.get( `/sites/${ siteId }/external-contributors`, {
				apiNamespace: 'wpcom/v2',
			} ),
		{ enabled: !! siteId }
	);

	const addMutation = useMutation(
		( userId ) =>
			wpcom.req.post(
				{
					path: `/sites/${ siteId }/external-contributors/add`,
					apiNamespace: 'wpcom/v2',
				},
				{ user_id: userId }
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries( `externalContributors-${ siteId }` );
			},
		}
	);

	const removeMutation = useMutation(
		( userId ) =>
			wpcom.req.post(
				{
					path: `/sites/${ siteId }/external-contributors/remove`,
					apiNamespace: 'wpcom/v2',
				},
				{ user_id: userId }
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries( `externalContributors-${ siteId }` );
			},
		}
	);

	// If props.forceSync is turned on, then
	// force our child component to remount when data changes,
	// by changing the key.
	//
	// This is meant as a workaround for children who try to "mirror" prop
	// values in states and don't listen to updates. This is not a recommended
	// pattern, but <EditUserForm> currently does it.
	// See: https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recap
	const syncProps = {};
	if ( forceSync ) {
		let k = isLoading ? 'loading-' : 'notloading-';
		k += ( data || [] ).length.toString();
		syncProps.key = k;
	}

	return (
		<Component
			externalContributors={ data ?? [] }
			isExternalContributorsLoading={ isLoading }
			isExternalContributorsError={ error }
			doAddExternalContributor={ ( userId ) => addMutation.mutate( userId ) }
			doRemoveExternalContributor={ ( userId ) => removeMutation.mutate( userId ) }
			{ ...props }
			{ ...syncProps }
		/>
	);
};
export default withExternalContributors;
