/*
 * Provide schema and validation for all data received by the API interfaces
 */

'use strict;'

const _ = require('underscore');

const Ajv = require('ajv');
const ajv = new Ajv({
  allErrors: true,
  schemas: get_schemas()
});

/*
	Validate an object against available schemas
 */
function validate(schema_name,data){
  var check = ajv.getSchema(schema_name);
  if ( !check ) throw Error(`[SCHEMA VALIDATION ERROR] No schema found for '${schema_name}'`);

  var valid = check(data);
  if (!valid) throw `[SCHEMA VALIDATION ERROR] Object for schema '${schema_name}' is not valid due to: ${ajv.errorsText(check.errors)}`;
}

function get_schemas(){
	return require('./schemas.json');
}

module.exports = validate;