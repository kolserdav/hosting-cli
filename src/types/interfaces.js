/**
 * @typedef {'node' | 'rust'} ServiceTypeCustom
 * @typedef {'redis' | 'postgres'} ServiceTypeCommon
 * @typedef {ServiceTypeCommon | ServiceTypeCustom} ServiceType
 */

export const ENVIRONMENT_SWITCH = {
  redis: {
    password: 'REDIS_PASSWORD',
  },
};

// Switch services
/**
 * @type {Record<ServiceTypeCommon, string>}
 */
export const ENVIRONMENT_EXCLUDED_CUSTOM = {
  redis: 'REDIS_HOST',
  postgres: 'POSTGRES_HOST',
};
/**
 * @type {Record<ServiceTypeCommon, string[]>}
 */
export const ENVIRONMENT_REQUIRED_COMMON = {
  redis: [ENVIRONMENT_SWITCH.redis.password],
  postgres: ['POSTGRES_PASSWORD', 'POSTGRES_USER', 'POSTGRES_DB'],
};

/**
 * @template T
 * @param {any} data
 * @returns {T}
 */
export function as(data) {
  return data;
}

/**
 * @type {ServiceTypeCustom[]}
 */
export const SERVICES_CUSTOM = ['node', 'rust'];

/**
 * @type {ServiceTypeCommon[]}
 */
export const SERVICES_COMMON = ['redis', 'postgres'];

/**
 * @type {any[]}
 */
const _SERVICES_COMMON = SERVICES_COMMON;

/**
 * @type {ServiceType[]}
 */
const SERVICE_TYPES = _SERVICES_COMMON.concat(SERVICES_CUSTOM);

/**
 * @typedef {'http' | 'ws'} PortType
 * @typedef { 'pico' | 'nano' | 'micro' | 'mili' | 'santi' | 'deci' |
 *  'deca' | 'hecto' | 'kilo' | 'mega' | 'giga' | 'tera'} ServiceSize
 * @typedef {{
 *  service: string;
 *  domains: Record<string, string>;
 * }} NewDomains
 * @typedef {{
 *  port: number;
 *  type: PortType;
 *  timeout?: string;
 * }} Port
 */

export const WEBSOCKET_ADDRESS = process.env.WEBSOCKET_ADDRESS || 'http://localhost:3002';

/**
 * @type {Port}
 */
export const PORT_DEFAULT = {
  port: 3000,
  type: 'http',
};

/**
 * @type {PortType[]}
 */
export const PORT_TYPES = ['http', 'ws'];

/**
 * @typedef {'custom' | 'common'} ServiceKind
 */

/**
 * @typedef {{
 *  project: string;
 *  services: Record<string, {
 *    active: boolean;
 *    type: ServiceType;
 *    size: string;
 *    version: string;
 *    command?: string;
 *    ports?: Port[];
 *    depends_on?: string[];
 *    domains?: NewDomains['domains'],
 *    environment?: string[];
 *  }>
 *  exclude?: string[]
 * }} ConfigFile
 */

/**
 * @typedef {{userId: string;}} Identity
 */

/**
 * @typedef {'info' | 'warn' | 'error'} Status
 */

/**
 * @typedef {object} WSMessageDataCli
 * @property {any} any
 * @property {string} setSocket
 * @property {string} test
 * @property {string} login
 * @property {boolean} checkToken
 * @property {{
 *  msg: string | number;
 *  end: boolean;
 * }} message
 * @property {{
 *  num: number;
 *  project: string;
 *  last: boolean;
 *  chunk: Uint8Array;
 *  config: ConfigFile | null;
 *  nodeName?: string;
 * }} deploy
 * @property {null} getDeployData
 * @property {{
 *  services: {
 *    type: ServiceType;
 *    name: string;
 *    images: string;
 *    tags: string[]
 * }[];
 *  sizes: {
 *    name: string;
 *    memory: {
 *     name: string;
 *     value: number;
 *    };
 *    cpus: number;
 *    storage: string;
 *  }[];
 *  baseValue: number;
 *  baseCost: number;
 * }} deployData
 * @property {{
 *  watch: boolean;
 *  timestamps: boolean;
 *  project: string;
 *  serviceName: string;
 *  since: string | undefined;
 *  until: string | undefined;
 *  tail: number | undefined;
 *  clear: boolean;
 * }} getLogs
 * @property {{
 *  last: boolean;
 *  text: string;
 *  num: number;
 * }} logs
 *  @property {{
 *  project: string;
 * }} remove
 * @property {NewDomains[]} setDomains
 */

/**
 * @template {keyof WSMessageDataCli} T
 * @typedef {{
 *  status: Status;
 *  type: T;
 *  packageName: string;
 *  message: string;
 *  userId: string;
 *  data: WSMessageDataCli[T];
 *  token: string | null;
 *  connId: string;
 * }} WSMessageCli
 */

export const PROTOCOL_CLI = 'cli';
export const PORT_MAX = 65535;
export const DOMAIN_MAX_LENGTH = 77;

/**
 *
 * @param {string} serviceSize
 * @param {Omit<WSMessageDataCli['deployData'], 'services'>} options
 */
export function computeCostService(serviceSize, { sizes, baseCost, baseValue }) {
  const currValueItem = sizes.find((item) => item.name === serviceSize);
  if (!currValueItem) {
    console.error('Failed to get cost of service for', serviceSize);
    return null;
  }
  const {
    memory: { value },
  } = currValueItem;
  const month = parseFloat((value / (baseValue / baseCost)).toFixed(2));
  const rub = month / 30 / 24;
  const hour = parseFloat(rub.toFixed(rub > 1 ? 2 : 3));
  return { month, hour };
}

/**
 * @template T
 * @param {string} msg
 * @returns {WSMessageCli<T> | null}
 */
export function parseMessageCli(msg) {
  let data = null;
  try {
    data = JSON.parse(msg);
  } catch (e) {
    console.error('Failed parse message', e);
  }
  return data;
}

/**
 * @param {ServiceType} type
 */
export const isCustomService = (type) => {
  return SERVICES_CUSTOM.indexOf(/** @type {typeof as<ServiceTypeCustom>} */ (as)(type)) !== -1;
};

/**
 * @param {ServiceType} type
 */
export const isCommonService = (type) => {
  return SERVICES_COMMON.indexOf(/** @type {typeof as<ServiceTypeCommon>} */ (as)(type)) !== -1;
};

/**
 * @param {string} item
 * @returns {string | null}
 */
const getEnvironmentValue = (item) => {
  /**
   * @type {string | null}
   */
  let res = null;
  const nameReg = /^[A-Za-z0-9_]+=/;
  if (nameReg.test(item)) {
    res = item.replace(nameReg, '');
  }
  return res;
};

/**
 * @param {string} name
 * @returns {string | null}
 */
const getEnvironmentName = (name) => {
  /**
   * @type {string | null}
   */
  let res = null;
  const nameReg = /^[A-Za-z0-9_]+=/;
  if (nameReg.test(name)) {
    res = name.replace(/=.*/, '');
  }
  return res;
};

/**
 * @param {string[]} environment
 * @param {string} name
 * @returns {string | null}
 */
export const findEnvironmentValue = (environment, name) => {
  /**
   * @type {string | null}
   */
  let res = null;
  environment.forEach((item) => {
    const _name = getEnvironmentName(item);
    if (_name === name) {
      res = item.replace(/^[A-Za-z0-9_]+=/, '');
    }
  });
  return res;
};

/**
 *
 * @param {Record<string, string>} record
 * @param {string} name
 * @returns
 */
export const checkRecord = (record, name) => {
  let check = false;
  const keys = Object.keys(record);
  keys.forEach((t) => {
    if (record[/** @type {typeof as<ServiceType>} */ (as)(t)] === name) {
      check = true;
    }
  });
  return check;
};

/**
 * @param {string} variable
 * @returns {{
 *  name: string;
 *  value: string;
 * } | null}
 */
export const parseEnvironmentVariable = (variable) => {
  const name = getEnvironmentName(variable);
  const value = getEnvironmentValue(variable);
  if (!name || !value) {
    return null;
  }
  return {
    name,
    value,
  };
};

/**
 * @param {string} name
 * @returns {boolean}
 */
export const checkEnvironmentRequired = (name) => {
  let check = false;
  Object.keys(ENVIRONMENT_REQUIRED_COMMON).forEach((item) => {
    ENVIRONMENT_REQUIRED_COMMON[/** @type {typeof as<ServiceTypeCommon>} */ (as)(item)].forEach(
      (_item) => {
        if (_item === name) {
          check = true;
        }
      }
    );
  });
  return check;
};

/**
 * @typedef {{msg: string; data: string; exit: boolean;}} CheckConfigResult
 * @param {ConfigFile} config
 * @returns {CheckConfigResult | null}
 */
export function checkConfig(config) {
  /**
   * @type {CheckConfigResult | null}
   */
  let res = null;

  // Check services field
  if (!config.services) {
    res = {
      msg: 'Required field is missing',
      data: 'services',
      exit: true,
    };
    return res;
  }

  const serviceKeys = Object.keys(config.services);

  // Check services lenght
  if (serviceKeys.length === 0) {
    res = {
      msg: 'Services list can not be empty',
      data: 'Add at least one service',
      exit: true,
    };
    return res;
  }

  serviceKeys.every((item) => {
    const { domains, ports, type, environment, version, command } = config.services[item];

    // Check service type
    if (SERVICE_TYPES.indexOf(type) === -1) {
      res = {
        msg: `Service type "${type}" is not allowed`,
        data: `Allowed service types: [${SERVICE_TYPES.join('|')}]`,
        exit: true,
      };
      return res;
    }

    // Check service version
    if (!version) {
      res = {
        msg: `Version doesn't exists in service "${item}"`,
        data: 'Try to add the field version to the config file',
        exit: true,
      };
      return res;
    }

    // Check custom services
    if (isCustomService(type)) {
      // Check ports
      (ports || []).forEach((item) => {
        if (PORT_TYPES.indexOf(item.type) === -1) {
          res = {
            msg: `Port type "${item.type}" is not allowed`,
            data: `Allowed port types: [${PORT_TYPES.join('|')}]`,
            exit: true,
          };
          return false;
        }
        return true;
      });
      if (res) {
        return res;
      }

      // Check domains
      if (domains) {
        Object.keys(domains).every((_item) => {
          const domain = domains[_item];
          if (domain.length > DOMAIN_MAX_LENGTH) {
            res = {
              msg: `Maximum allowed domain length is ${DOMAIN_MAX_LENGTH}. Passed domain is too long: ${domain.length}`,
              data: domain,
              exit: true,
            };
            return false;
          }
          return true;
        });
        if (res !== null) {
          return false;
        }
      }

      // Check environment format
      (environment || []).forEach((_item) => {
        const variable = parseEnvironmentVariable(_item);
        if (!variable) {
          res = {
            msg: `Environment variable ${_item} has wrong format`,
            data: `Try use NAME=value instead of ${_item}`,
            exit: true,
          };
        }
      });
      if (res) {
        return res;
      }

      // Check environment exclude
      (environment || []).forEach((_item) => {
        const variable = parseEnvironmentVariable(_item);
        if (!variable) {
          return;
        }
        const { name } = variable;
        if (name) {
          if (checkRecord(ENVIRONMENT_EXCLUDED_CUSTOM, name)) {
            res = {
              msg: `Environment variable ${_item} is not allowed here`,
              data: _item,
              exit: true,
            };
          }
        } else {
          res = {
            msg: `Environment variable ${_item} has wrong format`,
            data: 'Try use NAME=value instead',
            exit: true,
          };
        }
      });
      if (res) {
        return res;
      }
    }

    // Check common services
    if (isCommonService(type)) {
      // Check command
      if (command) {
        return {
          msg: `Field "command" is not allowed for service "${item}"`,
          data: `Command is only allowed for services [${SERVICES_CUSTOM.join('|')}]`,
          exit: false,
        };
      }

      // Check depends on
      let check = false;
      serviceKeys.every((_item) => {
        const { type: _type, depends_on } = config.services[_item];
        if (isCustomService(_type)) {
          if (!depends_on) {
            return true;
          }
          if (depends_on.indexOf(item) !== -1) {
            check = true;
            return false;
          }
        }
        return true;
      });
      if (!check) {
        res = {
          msg: `You have ${type} service with name ${item}, bun noone another service depends on it`,
          data: `Add "depends_on" field with item ${item} to any custom service`,
          exit: false,
        };
        return res;
      }

      const commonVaribles =
        ENVIRONMENT_REQUIRED_COMMON[/** @type {typeof as<ServiceTypeCommon>} */ (as)(type)];

      const _commonVariables = structuredClone(commonVaribles);
      // Check required environment
      commonVaribles.every((_item, index) => {
        let check = false;
        (environment || []).forEach((__item) => {
          const variable = parseEnvironmentVariable(__item);
          if (!variable) {
            return;
          }
          const { name } = variable;
          if (name === _item) {
            check = true;
            _commonVariables.splice(index, 1);
          }
        });
        if (!check) {
          res = {
            msg: `One or more required environment variables for service "${item}" is missing`,
            data: `Required [${_commonVariables.join(' & ')}]`,
            exit: true,
          };
          return false;
        }
        return true;
      });
      if (res) {
        return res;
      }

      // Check depends on
      (environment || []).forEach((_item) => {
        const variable = parseEnvironmentVariable(_item);
        if (!variable) {
          return;
        }
        const { name, value } = variable;

        const index = commonVaribles.indexOf(name);
        if (index !== -1) {
          serviceKeys.every((__item) => {
            const { type: _type, environment: _environment } = config.services[__item];
            if (isCustomService(_type)) {
              if (_environment) {
                let check = false;
                /**
                 * @type {string | null}
                 */
                let _envVal = null;
                _environment.forEach((___item) => {
                  const _envName = getEnvironmentName(___item);
                  if (_envName && _envName === name) {
                    check = true;
                    _envVal = getEnvironmentValue(___item);
                  }
                });
                if (!check) {
                  res = {
                    msg: `Service "${item}" provided ${name}, but in a service ${__item} dependent on it is not provided`,
                    data: `Try to add environment variable ${name} to the service ${__item}`,
                    exit: true,
                  };
                  return false;
                }
                if (value !== _envVal) {
                  res = {
                    msg: `Service "${item}" provided ${name}, but in a service ${__item} dependent on it this variable value is not the same`,
                    data: `Your service ${__item} will not be able to connect to service ${item}`,
                    exit: false,
                  };
                }
              }
            }
            return true;
          });
        }
      });
      if (res) {
        return res;
      }
    }

    return true;
  });
  return res;
}
