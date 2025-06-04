use anchor_lang::prelude::*;

declare_id!("EhjppSC6Etd2ZbXtc849HHHoTKNLGJC2EmjHwhSD5F2j");

#[program]
pub mod flappy_bird {
    use super::*;

    pub fn submit_score(ctx: Context<SubmitScore>, username: String, score: u32) -> Result<()> {
        require!(username.len() <= 32, CustomError::UsernameTooLong);

        let high_score = &mut ctx.accounts.high_score;

        if score > high_score.score {
            high_score.username = username.clone();
            high_score.score = score;
            msg!("New high score: {} by {}", score, username);
        } else {
            msg!("Score not high enough: {} by {}", score, username);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitScore<'info> {
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + 4 + 32 + 4, // 8 discriminator + 4 len prefix + 32 max string + 4 u32
        seeds = [b"highscore", player.key().as_ref()],
        bump
    )]
    pub high_score: Account<'info, HighScore>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct HighScore {
    pub username: String,
    pub score: u32,
}

#[error_code]
pub enum CustomError {
    #[msg("Username exceeds 32 characters.")]
    UsernameTooLong,
}