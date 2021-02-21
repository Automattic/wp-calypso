export const LaunchStep: Record< string, string > = {
	Name: 'name',
	Domain: 'domain',
	Plan: 'plan',
	Final: 'final',
};

export const LaunchSequence: Array< string > = [
	LaunchStep.Name,
	LaunchStep.Domain,
	LaunchStep.Plan,
	LaunchStep.Final,
];
