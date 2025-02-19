const { exhaustStream } = require('@evidence-dev/db-commons');
const runQuery = require('@evidence-dev/duckdb');

/** @type {import("@evidence-dev/db-commons").RunQuery<never>} */
module.exports = async (queryString, _, batchSize = 100000) => {
	return runQuery(queryString, { filename: ':memory:' }, batchSize);
};

/** @type {import("@evidence-dev/db-commons").GetRunner<never>} */
module.exports.getRunner = () => {
	return async (queryContent, queryPath, batchSize) => {
		// Filter out non-csv files
		if (!queryPath.endsWith('.csv')) return null;
		// Use DuckDBs auto CSV loading
		// https://duckdb.org/docs/data/csv/overview.html
		return runQuery(`SELECT * FROM '${queryPath}'`, { filename: ':memory:' }, batchSize);
	};
};

/** @type {import("@evidence-dev/db-commons").ConnectionTester<DuckDBOptions>} */
module.exports.testConnection = async (opts) => {
	const r = await runQuery('SELECT 1;', { ...opts, filename: ':memory:' })
		.then(exhaustStream)
		.then(() => true)
		.catch((e) => ({ reason: e.message ?? 'File not found' }));
	return r;
};

module.exports.options = {};
