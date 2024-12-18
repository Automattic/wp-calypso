export type ExperimentSlug = string;

type Variant = {
	/**
	 * A description of the variant. This is meant for humans.
	 */
	description?: string;

	/**
	 * The URL to redirect to when the variant is matched.
	 */
	url: string;
};

/**
 * Type variants to ensure `control` is always present.
 */
type Variants = {
	control: Variant;
} & Record< string, Variant >;

export type ExperimentManifest = {
	/**
	 * The title of the experiment. This is meant for humans.
	 */
	title: string;
	/**
	 * A description of the experiment. This is meant for humans.
	 */
	description: string;
	/**
	 * The experiment ID as defined in ExPlat.
	 */
	experiment_explat_id: string;
	/**
	 * The experiment slug as defined in ExPlat.
	 */
	experiment_explat_name: string;
	/**
	 * The variants of the experiment.
	 */
	variants: Variants;
};
