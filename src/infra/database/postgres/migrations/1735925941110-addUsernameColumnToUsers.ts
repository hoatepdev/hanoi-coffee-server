import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUsernameColumnToUsers1735925941110 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First add the column as nullable
    await queryRunner.query(`ALTER TABLE "users" ADD "username" text`);

    // Update existing records to use email as username
    await queryRunner.query(`UPDATE "users" SET username = email WHERE username IS NULL`);

    // Now make it NOT NULL
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
  }
}
