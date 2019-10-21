module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'postgre',
  database: 'goBarber',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true // padronização de tabelas e colunas através de underscored
  }
};
